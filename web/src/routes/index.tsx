import * as React from 'react';
import { History } from 'history';
import { Route, Switch } from 'react-router';
import { Router } from 'react-router-dom';
import NotFound from './NotFound';
import Home from './Home';

interface ManualProps {
  history: History;
}

const Layout = ({
  history
}: ManualProps) => {
  return (
    <Router history={history}>
      <div id="layout">
        <Switch>
          {/** Content routes */}
          <Route path={'/'} component={Home} exact={true} />
          <Route path={'/index.html'} component={Home} exact={true} />

          {/** No route matches */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
};

export default Layout as React.SFC<ManualProps>;
