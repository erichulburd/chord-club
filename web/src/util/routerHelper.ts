import { matchPath } from 'react-router';
import * as h from 'history';

export enum Routes {
  Home,
  NotFound
}

const routePaths: [Routes, string][] = [
  [Routes.Home, '/'] ,
  [Routes.Home, '/index.html'] ,
  [Routes.NotFound, '/not_found'] ,
];

const getPathForRoute = (route: Routes) => {
  const path = routePaths.find(([r, _path]) => r === route);
  return path[1] || '/';
};

interface RouteParams {
  [key: string]: string;
}

export const getParams = (location: h.Location, route: Routes): RouteParams => {
  const matchingPath = getPathForRoute(route);
  const m = matchPath(location.pathname, {
    path: matchingPath,
    exact: true,
    strict: false
  });
  return m?.params || {};
};

export const getCurrentRoute = (location: h.Location): Routes => {
  const routePath =
    routePaths.find(([_r, path]) => {
      return Boolean(matchPath(location.pathname, {
        path,
        exact: true,
        strict: false
      }));
    });
  let route = Routes.NotFound;
  if (routePath) route = routePath[0];
  return route;
};
