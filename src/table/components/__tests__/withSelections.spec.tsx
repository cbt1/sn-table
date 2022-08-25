import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TableCell from '@mui/material/TableCell';

import { TableContextProvider } from '../../context';
import * as withSelections from '../withSelections';
import { SelectionActions } from '../../utils/selections-utils';
import { Announce, ExtendedSelectionAPI, Cell, Column } from '../../../types';
import { CellStyle, CellHOCProps } from '../../types';

describe('withSelections', () => {
  const value = '100';
  const selectionsAPI = { isModal: () => false } as unknown as ExtendedSelectionAPI;
  let HOC: (props: CellHOCProps) => JSX.Element;
  let cell: Cell;
  let evt: React.MouseEvent;
  let styling: CellStyle;
  let announce: Announce;
  let column: Column;
  let selectionDispatchMock: jest.Mock<any, any>;

  const renderWithSelections = () =>
    render(
      <TableContextProvider selectionsAPI={selectionsAPI} selectionDispatchMock={selectionDispatchMock}>
        <HOC cell={cell} styling={styling} announce={announce} column={column}>
          {value}
        </HOC>
      </TableContextProvider>
    );

  beforeEach(() => {
    HOC = withSelections.default((props: CellHOCProps) => <TableCell {...props}>{props.children}</TableCell>);
    cell = {
      isSelectable: true,
    } as unknown as Cell;
    evt = { button: 0 } as unknown as React.MouseEvent;
    styling = {} as unknown as CellStyle;
    announce = () => undefined as unknown as Announce;
    selectionDispatchMock = jest.fn();
  });

  afterEach(() => jest.clearAllMocks());

  it('should render a mocked component with the passed value', () => {
    const { queryByText } = renderWithSelections();

    expect(queryByText(value)).toBeVisible();
  });

  it('should call selectCell on mouseUp', () => {
    const { getByText } = renderWithSelections();
    fireEvent.mouseUp(getByText(value), evt);

    expect(selectionDispatchMock).toHaveBeenCalledTimes(1);
    expect(selectionDispatchMock).toHaveBeenCalledWith({
      type: SelectionActions.SELECT,
      payload: { cell, evt: expect.anything(), announce },
    });
  });

  it('should not call selectCell on mouseUp when measure', () => {
    cell.isSelectable = false;

    const { getByText } = renderWithSelections();
    fireEvent.mouseUp(getByText(value), evt);

    expect(selectionDispatchMock).not.toHaveBeenCalled();
  });

  it('should not call selectCell on mouseUp when right button', () => {
    evt.button = 2;

    const { getByText } = renderWithSelections();
    fireEvent.mouseUp(getByText(value), evt);

    expect(selectionDispatchMock).not.toHaveBeenCalled();
  });
});
