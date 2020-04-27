import gql from 'graphql-tag';
import { ChartNew, Chart, ChartQuery, ChartType } from '../types';
import { tagDBFields } from './tag';

export const chartDBFields = gql`
  fragment ChartDBFields on Chart {
    id audioURL audioLength imageURL hint notes
    abc scope chartType bassNote
    root quality createdAt createdBy updatedAt
  }
`;

export const CREATE_CHART_NEW = gql`
  mutation CreateChartNew($chartNew: ChartNew!) {
    createChart(chartNew: $chartNew) {
      ...ChartDBFields
    }
  }
  ${chartDBFields}
`;

export interface CreateChartVariables {
  chartNew: ChartNew;
}

export interface CreateChartResponse {
  createChart: ChartNew;
}

export const CHARTS_QUERY = gql`
  query ChartsQuery($query: ChartQuery!) {
    charts(query: $query) {
      ...ChartDBFields
      creator { uid username } reactionCounts { stars } userReactionType
      tags { ...TagDBFields }
    }
  }
  ${chartDBFields}
  ${tagDBFields}
`;

export interface ChartsQueryVariables {
  query: ChartQuery;
}

export interface ChartsQueryResponse {
  charts: Chart[];
}


export const CHART_EXTENSIONS_QUERY = gql`
  query ChartsExtensionsQuery($chartID: Int!, $chartTypes: [ChartType!]!) {
    charts(query: { id: $chartID, chartTypes: $chartTypes }) {
      extensions { id degree extensionType }
    }
  }
`;

export interface ChartExtensionsQueryVariables {
  chartID: number;
  chartTypes: ChartType[];
}

export interface ChartExtensionsQueryResponse {
  charts: Chart[];
}
