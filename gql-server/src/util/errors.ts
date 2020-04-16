import { AuthenticationError, ApolloError, UserInputError } from 'apollo-server-express';
import { ErrorType, TagBase } from '../types';

export const unauthenticatedError = new AuthenticationError(
    'We couldn\'t verify your identity. Your authentication credential is missing or invalid.');

export const chartNotFoundError = (chartID: number) => new ApolloError(
    'We couldn\'t find the chart you requested.',
    ErrorType.ChartNotFound.toUpperCase(),
    {
      chartID,
    });

export const invalidTagQueryScopeError = (scope: string) => new UserInputError(
  'You cannot query tags for this scope.', { scope, code: 'INVALID_TAG_QUERY_SCOPE_ERROR' });

export const invalidNewTagsScopeError = (tag: TagBase) => new UserInputError(
  'You cannot query for this tag.', { tag, code: 'INVALID_TAG_SCOPE_ERROR' });

export const invalidChartTagError = (chartID: number, tag: TagBase) => new UserInputError(
  'This tag is invalid for the chart.', { chartID, tag, code: 'INVALID_CHART_TAG_ERROR' });

export const invalidChartScope = (scope: string) => new UserInputError(
  'This scope is invalid for the chart.', { scope, code: 'INVALID_CHART_SCOPE' });

export const pgReactionUniqueError = /duplicate key value violates unique constraint "reaction_unique"/i;

export const invalidChartReactionError = (chartID: number) => new ApolloError(
  'You have already reacted to this chart.', 'INVALID_CHART_REACTION', { chartID });
