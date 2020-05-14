import * as React from 'react';
import { render } from 'react-dom';
import { createBrowserHistory } from 'history';
import Routes from './routes';

/**
 * Here we (1) initialize Redux store and (2) History. If
 * add real internationalization support, we will also want
 * to initialize the i18n language files here.
 */
const initializeApp = async () => {
  const history = createBrowserHistory({});

  // After initializing story, query parameters will be stored in state.
  // Push the pathname without query string to remove them.
  history.push(history.location.pathname);

  render(
    (React.createElement(Routes, { history })),
    document.getElementById('app')
  );
};

initializeApp();
