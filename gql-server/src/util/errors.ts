import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { ErrorType } from '../types';

export const unauthenticatedError = new AuthenticationError(
    'We couldn\'t verify your identity. Your authentication credential is missing or invalid.');

export const chartNotFoundError = (chartID: number) => new ApolloError(
    'We couldn\'t find the chart you requested.',
    ErrorType.ChartNotFound.toUpperCase(),
    {
      chartID,
    });

