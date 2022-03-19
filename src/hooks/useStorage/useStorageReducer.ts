import {
  Dispatch as ReactDispatch,
  Reducer as ReactReducer,
  ReducerAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { StorageInterface } from '../../services';
import { hasOwnProperty } from '../../utils';
import { registerStorageManagerForStorage, unregisterStorageManagerForStorage } from './registerStorageManager';
import { StorageManagerEvent } from './StorageManager';

interface UseStorageReducerProps<StorageData, Reducer extends ReactReducer<StorageData | undefined, unknown>> {
  storage: StorageInterface<StorageData>;
  reducer: Reducer;
}

type HookResult<StorageData, Reducer extends ReactReducer<StorageData | undefined, unknown>> =
  | {
      isInitialized: true;
      error: undefined;
      reducerState: StorageData;
      dispatch: ReactDispatch<ReducerAction<Reducer>>;
    }
  | {
      isInitialized: true;
      error: Error;
      reducerState: undefined;
      dispatch: ReactDispatch<ReducerAction<Reducer>>;
    }
  | {
      isInitialized: false;
      error: undefined;
      reducerState: undefined;
      dispatch: ReactDispatch<ReducerAction<Reducer>>;
    };

interface StorageAction<StorageData> {
  type: symbol;
  data: StorageData;
}

const STORAGE_ACTION_TYPE = Symbol('Storage action');

export function useStorageReducer<
  StorageData,
  Reducer extends ReactReducer<
    StorageData | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >,
>(props: UseStorageReducerProps<StorageData, Reducer>): HookResult<StorageData, Reducer> {
  const { storage, reducer } = props;
  const storageManager = useMemo(() => registerStorageManagerForStorage(storage), []);

  const initialState = storageManager.data;
  const reducerWithMiddleware = useMemo(
    // TODO find out why `Reducer` type that is returned by `injectMiddlewareToReducer`
    // does not satisfy `useReducer` below. To check it, just remove `ReactReducer` return
    // type from right below, so that `reducerWithMiddleware` is inferred by TS from `injectMiddlewareToReducer`.
    (): ReactReducer<
      StorageData | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    > => injectMiddlewareToReducer<StorageData, Reducer>(reducer),
    [],
  );
  const [reducerState, dispatch] = useReducer(reducerWithMiddleware, initialState);

  const [managerEventWithoutData, setManagerEventWithoutData] = useState<
    Omit<StorageManagerEvent<StorageData>, 'data'>
  >(storageManager.getManagerEvent());

  const latestPayloadIndexRef = useRef(storageManager.payloadIndex);
  const latestLocalDataSentToStorageRef = useRef(storageManager.data);
  const isInitializedRef = useRef(storageManager.isInitialized);

  // Initialize saving the data from the reducer to the storage
  const wrappedDispatch = useCallback((action: ReducerAction<Reducer>) => {
    if (!isInitializedRef.current) {
      throw new Error('Cannot dispatch data before initialization');
    }

    // Set to an impossible value to use as a flag that the value is changed locally and that it needs to
    // be saved to the storage. We cannot get the actual value here as it will be available only after
    // the reducer finishes its work.
    latestPayloadIndexRef.current = -1;
    dispatch(action);
  }, []);

  // Sync data from the storage to the reducer
  useEffect(() => {
    const handleData = ({ isInitialized, error, data, payloadIndex }: StorageManagerEvent<StorageData>) => {
      isInitializedRef.current = isInitialized;

      if (
        // Avoid re-rendering in case if the initial data matches the first data event in case when this
        // use effect is executed after the data is initialized and the `useStorageReducer` hook itself also is started
        // after the data is initialized (this is possible if this hook is used two times or more for the same storage
        // in different places of the app).
        latestPayloadIndexRef.current === payloadIndex
      ) {
        return;
      }

      latestPayloadIndexRef.current = payloadIndex;

      dispatch(getStorageAction(data));
      setManagerEventWithoutData({ isInitialized, error, payloadIndex });
    };

    // Sync all data from the storage to the state and reducer:
    // - initial data
    // - outside changes
    // - direct state changes (outside this hook)
    storageManager.dataEvent.subscribe(handleData);

    return () => {
      storageManager.dataEvent.unsubscribe(handleData);
      unregisterStorageManagerForStorage(storage);
    };
  }, []);

  // Sync the data from the reducer to the storage
  useEffect(() => {
    if (
      // Verify that it is actually a local change
      latestPayloadIndexRef.current === -1 &&
      reducerState !== undefined
    ) {
      latestLocalDataSentToStorageRef.current = reducerState;
      storageManager.setData(reducerState, {
        // TODO test it
        isSilent: true,
      });
    }
  }, [reducerState]);

  // TODO consider using `as` to reducer number of if statements
  if (managerEventWithoutData.isInitialized && managerEventWithoutData.error) {
    return {
      reducerState: undefined,
      isInitialized: managerEventWithoutData.isInitialized,
      dispatch: wrappedDispatch,
      error: managerEventWithoutData.error,
    };
  } else if (managerEventWithoutData.isInitialized && reducerState) {
    return {
      reducerState,
      isInitialized: managerEventWithoutData.isInitialized,
      dispatch: wrappedDispatch,
      error: undefined,
    };
  } else {
    return {
      reducerState: undefined,
      isInitialized: false,
      dispatch: wrappedDispatch,
      error: undefined,
    };
  }
}

function getStorageAction<StorageData>(data: StorageData): StorageAction<StorageData> {
  return {
    type: STORAGE_ACTION_TYPE,
    data,
  };
}

function isStorageAction<StorageData>(action: unknown): action is StorageAction<StorageData> {
  return (
    !!action && typeof action === 'object' && hasOwnProperty(action, 'type') && action.type === STORAGE_ACTION_TYPE
  );
}

function injectMiddlewareToReducer<
  StorageData,
  Reducer extends ReactReducer<
    StorageData | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >,
>(reducer: Reducer): Reducer {
  const wrappedReducer = (
    prevState: StorageData | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: any,
  ): StorageData | undefined => {
    // Whenever there is an update in the storage we need to override the current data in the reducer
    if (isStorageAction<StorageData>(action)) {
      return action.data;
    }

    return reducer(prevState, action);
  };

  // TODO why types don't match without `as`, as `wrappedReducer` implemented in a way to be compliant with `Reducer`.
  return wrappedReducer as Reducer;
}
