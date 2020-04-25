import gql from 'graphql-tag';
import { ChartNew } from '../types';

export const chartDBFields = gql`
  fragment ChartDBFields on Chart {
    id audioURL imageURL hint notes
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
