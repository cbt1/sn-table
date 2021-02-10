import '../../../test-setup';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';

import TableWrapper from '../TableWrapper';
import * as TableBodyWrapper from '../TableBodyWrapper';
import * as TableHeadWrapper from '../TableHeadWrapper';

describe('<TableWrapper />', () => {
  const sandbox = sinon.createSandbox();
  let tableData;
  let setPageInfo;
  let constraints;
  let rowsPerPage;

  beforeEach(() => {
    sandbox.replace(TableBodyWrapper, 'default', () => <tbody />);
    sandbox.replace(TableHeadWrapper, 'default', () => <thead />);

    tableData = {
      size: { qcy: 200 },
      rows: [{ qText: '1' }],
    };
    setPageInfo = sinon.spy();
    constraints = {};
    rowsPerPage = 100;
  });

  afterEach(() => {
    sandbox.verifyAndRestore();
    sandbox.resetHistory();
  });

  it('should render table', () => {
    const { queryByLabelText, queryByText } = render(
      <TableWrapper tableData={tableData} setPageInfo={setPageInfo} constraints={constraints} />
    );

    expect(queryByLabelText('sticky table')).to.be.visible;
    expect(queryByText(`1-${rowsPerPage} of ${tableData.size.qcy}`)).to.be.visible;
    expect(queryByText(rowsPerPage)).to.be.visible;
  });
  it('should call setPageInfo when clicking next page button', async () => {
    const { findByTitle, findByText } = render(
      <TableWrapper tableData={tableData} setPageInfo={setPageInfo} constraints={constraints} />
    );
    fireEvent.click(await findByTitle('Next page'));

    expect(setPageInfo).to.have.been.calledWith({ top: rowsPerPage, height: rowsPerPage });
    expect(await findByText(`101-200 of ${tableData.size.qcy}`)).to.be.visible;
  });
  it('should change back to first page when not on first page and no rows', async () => {
    const { findByTitle } = render(
      <TableWrapper tableData={tableData} setPageInfo={setPageInfo} constraints={constraints} />
    );
    // This is a hack to simulate when selections are made on other page than first page and
    // rows per page is bigger than the selected rows -> handle data returns no rows.
    tableData.rows = [];
    fireEvent.click(await findByTitle('Next page'));

    // Called when pressing the button
    expect(setPageInfo).to.have.been.calledWith({ top: rowsPerPage, height: rowsPerPage });
    // Called from if statement in TableWrapper
    expect(setPageInfo).to.have.been.calledWith({ top: 0, height: rowsPerPage });
  });
  it('should call setPageInfo when changing rows per page', async () => {
    const { findByText } = render(
      <TableWrapper tableData={tableData} setPageInfo={setPageInfo} constraints={constraints} />
    );
    // the popover is only triggered with mouseDown, according to the mui definition
    fireEvent.mouseDown(await findByText(rowsPerPage));
    fireEvent.click(await findByText('25'));

    expect(setPageInfo).to.have.been.calledWith({ top: 0, height: 25 });
  });
});
