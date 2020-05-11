import { makeDBPool, TestDBClientManager, DBTxManager } from '../../repositories/db';
import { PoolClient } from 'pg';
import { initializeApp } from '../../util/app';
import supertest from 'supertest';
import { getTestKey, signWithTestKey } from '../../../tests/testingKeys';
import { makeChartNew, makeExtension, makeTagNew } from '../../../tests/factories';
import express from 'express';
import { ChartUpdate, Extension, ExtensionType, BaseScopes, Tag } from '../../types';
import { findChartByID, insertNewChart } from '../../repositories/chart';
import { insertExtensions, findExtensionsForCharts } from '../../repositories/extensions';
import { insertNewTags } from '../../repositories/tag';


describe('chart ops', () => {
  const pool = makeDBPool();
  let dbClientManager: TestDBClientManager;
  let app: express.Express;
  let client: PoolClient;
  let txManager: DBTxManager;
  let graphql: () => supertest.Test;
  const token = signWithTestKey({ sub: 'uid' });

  beforeEach(async () => {
    dbClientManager = await TestDBClientManager.new(pool);
    app = initializeApp(dbClientManager, getTestKey);
    const conn = await dbClientManager.newConnection();
    client = conn[0];
    txManager = conn[1];
    graphql = () => supertest(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  });

  afterEach(async () => {
    await dbClientManager.rollbackAndRelease();
  });

  afterAll(async () => {
    await pool.end();
  });

  test('chart crud ops', async () => {
    const chartNew = makeChartNew();
    const res1 = await graphql().send({
      query: `
        mutation ($chartNew: ChartNew!) {
          createChart(chartNew: $chartNew) {
            id quality abc root bassNote extensions { id degree extensionType }
          }
        }
      `,
      variables: { chartNew },
    }).expect(200);
    const { data, errors } = res1.body;
    expect(errors).toEqual(undefined);
    expect(data.createChart.quality).toEqual(chartNew.quality);
    expect(data.createChart.abc).toEqual(chartNew.abc);
    expect(data.createChart.bassNote).toEqual(chartNew.bassNote);
    expect(data.createChart.root).toEqual(chartNew.root);
    expect(data.createChart.id).not.toEqual(undefined);
    expect(data.createChart.extensions).toEqual([]);

    const chartUpdate: ChartUpdate = { id: data.createChart.id, audioURL: 'https://google.com/audio' };
    const res2 = await graphql().send({
      query: `
        mutation ($chartUpdate: ChartUpdate!) {
          updateChart(chartUpdate: $chartUpdate) {
            id quality abc root bassNote audioURL extensions { id degree extensionType }
          }
        }
      `,
      variables: { chartUpdate },
    }).expect(200);

    const body2 = res2.body;
    expect(body2.errors).toEqual(undefined);
    expect(body2.data.updateChart.quality).toEqual(chartNew.quality);
    expect(body2.data.updateChart.abc).toEqual(chartNew.abc);
    expect(body2.data.updateChart.bassNote).toEqual(chartNew.bassNote);
    expect(body2.data.updateChart.root).toEqual(chartNew.root);
    expect(body2.data.updateChart.id).not.toEqual(undefined);
    expect(body2.data.updateChart.extensions).toEqual([]);
    expect(body2.data.updateChart.audioURL).toEqual('https://google.com/audio');

    const res3 = await graphql().send({
      query: `
        mutation ($chartID: Int!) {
          deleteChart(chartID: $chartID) { empty }
        }
      `,
      variables: {
        chartID: body2.data.updateChart.id,
      },
    }).expect(200);
    const body3 = res3.body;
    expect(body3.errors).toEqual(undefined);
    const chart = await findChartByID(body2.data.updateChart.id, 'uid', client);
    expect(chart).toEqual(undefined);
  });

  test('chart extension ops', async () => {
    const extensions =
      await insertExtensions([
        makeExtension({ degree: 9, extensionType: ExtensionType.Plain }),
        makeExtension({ degree: 6 }),
        makeExtension({ degree: 7 }),
        makeExtension({ degree: 9, extensionType: ExtensionType.Flat }),
      ], client);
    const expectedExtensionIDs = extensions.slice(0, 2).map((e) => e.id);
    const omittedExtensionIDs = extensions.slice(2).map((e) => e.id);
    const chartNew = makeChartNew({
      extensionIDs: expectedExtensionIDs,
    });
    const res1 = await graphql().send({
      query: `
        mutation ($chartNew: ChartNew!) {
          createChart(chartNew: $chartNew) {
            id quality abc root bassNote extensions { id degree extensionType }
          }
        }
      `,
      variables: { chartNew },
    }).expect(200);
    const { data, errors } = res1.body;
    expect(errors).toEqual(undefined);
    const chartExtensions: Extension[] = data.createChart.extensions;
    expect(
      chartExtensions.every((e) => expectedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(true);
    expect(
      chartExtensions.some((e) => omittedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(false);
    const savedExtensions = await findExtensionsForCharts([data.createChart.id], client);
    expect(savedExtensions[0].length).toEqual(2);
    expect(
      savedExtensions[0].every((e) => expectedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(true);

    const res2 = await graphql().send({
      query: `
        mutation ($chartID: Int!, $extensionIDs: [Int!]!) {
          addExtensions(chartID: $chartID, extensionIDs: $extensionIDs) {
            extensions { id degree extensionType }
          }
        }
      `,
      variables: {
        chartID: data.createChart.id,
        extensionIDs: omittedExtensionIDs,
      },
    }).expect(200);
    let allExtensions: Extension[] = res2.body.data.addExtensions.extensions;
    expect(allExtensions.length).toEqual(4);
    expect(Object.keys(allExtensions.reduce((prev: {}, e) => ({
      ...prev,
      [e.id]: true
    }), {})).length).toEqual(4);

    const res3 = await graphql().send({
      query: `
        mutation ($chartID: Int!, $extensionIDs: [Int!]!) {
          removeExtensions(chartID: $chartID, extensionIDs: $extensionIDs) {
            extensions { id degree extensionType }
          }
        }
      `,
      variables: {
        chartID: data.createChart.id,
        extensionIDs: expectedExtensionIDs,
      },
    }).expect(200);
    allExtensions = res3.body.data.removeExtensions.extensions;
    expect(allExtensions.length).toEqual(2);
    expect(
      allExtensions.every((e) => omittedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(true);
    expect(
      allExtensions.some((e) => expectedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(false);
    allExtensions = (await findExtensionsForCharts([data.createChart.id], client))[0];
    expect(allExtensions.length).toEqual(2);
    expect(
      allExtensions.every((e) => omittedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(true);
    expect(
      allExtensions.some((e) => expectedExtensionIDs.indexOf(e.id) >= 0)
    ).toEqual(false);
  });

  test('chart tag ops', async () => {
    // this just creates some noise for the test.
    await insertNewTags(
      [makeTagNew(), makeTagNew(), makeTagNew()], 'uid', client,
    );
    let tagNews = [
      makeTagNew(),
      makeTagNew(),
      makeTagNew(),
      makeTagNew(),
    ];
    const chartNew = makeChartNew({
      tags: tagNews,
      scope: BaseScopes.Public,
    });
    const res1 = await graphql().send({
      query: `
        mutation ($chartNew: ChartNew!) {
          createChart(chartNew: $chartNew) {
            id quality abc root bassNote tags { id displayName munge scope }
          }
        }
      `,
      variables: { chartNew },
    }).expect(200);
    const { data, errors } = res1.body;
    expect(errors).toEqual(undefined);
    const addedTags: Tag[] = data.createChart.tags;
    expect(addedTags.every((t) => t.id !== undefined)).toEqual(true);
    expect(
      addedTags.every((t) => tagNews.some(tn => tn.displayName === t.displayName)),
    ).toEqual(true);

    const tagNews2 = [
      makeTagNew(),
      makeTagNew(),
    ];
    const res2 = await graphql().send({
      query: `
        mutation ($chartID: Int!, $tags: [TagNew!]!) {
          addTags(chartID: $chartID, tags: $tags) {
            tags { id displayName munge scope }
          }
        }
      `,
      variables: {
        chartID: data.createChart.id,
        tags: tagNews2,
      },
    }).expect(200);
    let allTags: Tag[] = res2.body.data.addTags.tags;
    expect(allTags.length).toEqual(6);
    expect(Object.keys(allTags.reduce((prev: {}, e) => ({
      ...prev,
      [e.id]: true
    }), {})).length).toEqual(6);

    const res3 = await graphql().send({
      query: `
        mutation ($chartID: Int!, $tagIDs: [Int!]!) {
          unTag(chartID: $chartID, tagIDs: $tagIDs) {
            tags { id displayName munge scope }
          }
        }
      `,
      variables: {
        chartID: data.createChart.id,
        tagIDs: [allTags[0].id],
      },
    }).expect(200);

    allTags = res3.body.data.unTag.tags;
    expect(allTags.length).toEqual(5);
  });
});
