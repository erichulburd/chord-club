import { AuthenticationError, ApolloError } from 'apollo-server-express';
import { ErrorType, TagBase } from '../types';

export const unauthenticatedError = new AuthenticationError(
    'We couldn\'t verify your identity. Your authentication credential is missing or invalid.');

export const chartNotFoundError = (chartID: number) => new ApolloError(
    'We couldn\'t find the chart you requested.',
    ErrorType.ChartNotFound,
    {
      chartID,
    });

export const invalidTagQueryScopeError = (scope: string) => new ApolloError(
  ErrorType.InvalidTagQueryScopeError,
  'You cannot query tags for this scope.', { scope });

export const invalidNewTagsScopeError = (tag: TagBase) => new ApolloError(
  ErrorType.InvalidTagScopeError,
  'You cannot query for this tag.', { tag });

export const invalidChartTagError = (chartID: number, tag: TagBase) => new ApolloError(
  ErrorType.InvalidChartTagError,
  'This tag is invalid for the chart.', { chartID, tag });

export const invalidTagPositionUpdate = () => new ApolloError(
  ErrorType.InvalidChartTagError,
  'Must have a single tag position for each chart.', {});

export const invalidChartScope = (scope: string) => new ApolloError(
  ErrorType.InvalidChartScope,
  'This scope is invalid for the chart.', { scope });

export const pgReactionUniqueError = /duplicate key value violates unique constraint "reaction_unique"/i;

export const invalidChartReactionError = (chartID: number) => new ApolloError(
  'You have already reacted to this chart.', ErrorType.InvalidChartTagError, { chartID });

export const forbiddenResourceOpError = (data: any = {}) => new ApolloError(
  'You are not authorized to perform this operation.', ErrorType.ForbiddenResourceOperation, data);
