import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';

import { MainView } from './views';

console.log(
  'Hello! Thank you for taking interest in Mi-q! This is an open source app. Use this link https://github.com/karpov-kir/mi-q to find out more.',
);

Modal.setAppElement('#root');
ReactDOM.render(
  <StrictMode>
    <MainView />
    <Toaster />
  </StrictMode>,
  document.getElementById('root'),
);
