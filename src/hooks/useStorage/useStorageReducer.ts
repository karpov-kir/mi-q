import {
  Dispatch as ReactDispatch,
  Reducer as ReactReducer,
  ReducerAction,
  ReducerState,
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

interface HookResult<StorageData, Reducer extends ReactReducer<StorageData | undefined, unknown>> {
  isInitialized: boolean;
  error?: Error;
  reducerState?: StorageData;
  dispatch: ReactDispatch<ReducerAction<Reducer>>;
}

interface StorageAction {
  type: symbol;
  data: unknown;
}

const STORAGE_ACTION_TYPE = Symbol('Init');

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

  // TODO find out why the type is not inferred
  const initialState = storageManager.data as ReducerState<Reducer>;
  const reducerWithMiddleware = useMemo(() => injectMiddlewareToReducer<StorageData, Reducer>(reducer), []);
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
        // use effect is executed after the data is initialized and the hook itself also is started after the data
        // is initialized (this is possible if this hook is used two times or more for the same storage
        // in different places of the app).
        latestPayloadIndexRef.current === payloadIndex ||
        // Make sure that the new data is not actually the latest local data sent to the storage. We don't need to
        // update the local data as the reducer updates the local data when the action is dispatched
        // with `wrappedDispatch`.
        latestLocalDataSentToStorageRef.current === data
      ) {
        return;
      }

      latestPayloadIndexRef.current = payloadIndex;

      dispatch(getStorageAction(data) as ReducerAction<Reducer>);
      setManagerEventWithoutData({ isInitialized, error, payloadIndex });
    };

    // Sync all data from the storage to the state and reducer:
    // - initial data
    // - outside changes
    // - direct state changes
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
      storageManager.setData(reducerState as StorageData);
    }
  }, [reducerState]);

  return {
    reducerState,
    isInitialized: managerEventWithoutData.isInitialized,
    dispatch: wrappedDispatch,
    error: managerEventWithoutData.error,
  };
}

function getStorageAction(data: unknown): StorageAction {
  return {
    type: STORAGE_ACTION_TYPE,
    data,
  };
}

function isStorageAction(action: unknown): action is StorageAction {
  return (
    !!action && typeof action === 'object' && hasOwnProperty(action, 'type') && action.type === STORAGE_ACTION_TYPE
  );
}

function injectMiddlewareToReducer<StorageData, Reducer extends ReactReducer<StorageData | undefined, unknown>>(
  reducer: Reducer,
) {
  const wrappedReducer = (prevState: StorageData | undefined, action: unknown) => {
    // Whenever there is an update in the storage we need to override the current data in the reducer
    if (isStorageAction(action)) {
      return action.data;
    }

    return reducer(prevState, action);
  };

  return wrappedReducer as Reducer;
}
