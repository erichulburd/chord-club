import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { ErrorType, Tag, TagNew } from '../types';

export const unauthenticatedError = new AuthenticationError(
    'We couldn\'t verify your identity. Your authentication credential is missing or invalid.');

export const notFoundError = <T extends object>(data: T) => new ApolloError(
    'We couldn\'t find the requested resource.',
    ErrorType.NotFound, data);

export const chartNotFoundError = (chartID: number) => new ApolloError(
    'We couldn\'t find the chart you requested.',
    ErrorType.ChartNotFound,
    {
      chartID,
    });

export const invalidChartTagError = (chartID: number, tag: Tag | TagNew) => new ApolloError(
  ErrorType.InvalidChartTagError,
  'This tag is invalid for the chart.', { chartID, tag });

export const invalidTagPositionUpdate = () => new ApolloError(
  ErrorType.InvalidChartTagError,
  'Must have a single tag position for each chart.', {});

export const pgReactionUniqueError = /duplicate key value violates unique constraint "reaction_unique"/i;

export const pgUsernameUniqueError = /duplicate key value violates unique constraint "userr_username_unique"/i;

export const invalidChartReactionError = (chartID: number) => new ApolloError(
  'You have already reacted to this chart.', ErrorType.InvalidChartTagError, { chartID });

export const forbiddenResourceOpError = (data: any = {}) => new ApolloError(
  'You are not authorized to perform this operation.', ErrorType.ForbiddenResourceOperation, data);

export const usernameUniqueError = () => new ApolloError(
  'This username has already been taken.', ErrorType.DuplicateUsername);

export const invalidInvitationTokenError = (err: any) => new ApolloError(
  'The provided sharing token is not valid.', ErrorType.InvalidInvitationToken, { err });

export const coerceUnhandledError = (err: Error) => {
  if (err instanceof ApolloError) {
    return err;
  }
  if (pgUsernameUniqueError.test(err.message)) {
    return usernameUniqueError();
  }
  if (pgReactionUniqueError.test(err.message)) {
    return invalidChartReactionError(0);
  }
  return new ApolloError(err.message, ErrorType.Unhandled);
};
