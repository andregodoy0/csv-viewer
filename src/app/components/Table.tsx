"use client";

import { parse } from "csv-parse";
import { useState } from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

const fallbackdata = [
  { "string type": "1 string", currency: "20.00", "number type": 1, "date type": "2024-05-24" },
  { "string type": "2 string", currency: "10.50", "number type": 20, "date type": "2024-05-24" },
  { "string type": "3 string", currency: "150.95", "number type": 300, "date type": "2024-05-24" },
  { "string type": "4 string", currency: "2000.00", "number type": 4000, "date type": "2024-05-24" },
  { "string type": "5 string", currency: "1253.20", "number type": 50000, "date type": "2024-05-24" },
] as Record<string, unknown>[];

// TODO organize formatters
const numberFormatter = new Intl.NumberFormat(navigator.language, {
  style: "currency",
  currency: "USD",
});
const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
  timeZone: "America/Sao_Paulo",
});
const textCell = (props: { getValue: () => string | number }) => <div className="text-left">{props.getValue()}</div>;
const numberCell = (props: { getValue: () => string | number }) => <div className="text-right">{props.getValue()}</div>;
const currencyCell = (props: { getValue: () => string | number }) => (
  <div className="text-right">{numberFormatter.format(props.getValue() as number)}</div>
);
const dateCell = (props: { getValue: () => string | number }) => {
  try {
    return <div className="text-right">{dateFormatter.format(new Date(props.getValue()))}</div>;
  } catch {
    return <div className="text-right">{props.getValue()}</div>;
  }
};

const CELL_FORMATTERS = {
  number: numberCell,
  text: textCell,
  currency: currencyCell,
  date: dateCell,
};
const currencyRegex = /^\d+\.\d{2}$/;
const dateRegex = /\d{4}-\d{2}-\d{2}/;

const getCellTypeFormatter = (cell: unknown) => {
  switch (typeof cell) {
    case "number":
    case "bigint":
      if (currencyRegex.test(cell.toString())) {
        return CELL_FORMATTERS["currency" as const];
      }
      return CELL_FORMATTERS["number" as const];
    case "string":
      if (currencyRegex.test(cell)) {
        return CELL_FORMATTERS["currency" as const];
      }
      if (dateRegex.test(cell)) {
        return CELL_FORMATTERS["date" as const];
      }
    default:
      return CELL_FORMATTERS["text" as const];
  }
};

const setDefaultColumns = (data: Record<string, unknown> = {}) =>
  Object.keys(data).map(
    (key) =>
      ({
        header: key,
        accessorKey: key,
        cell: getCellTypeFormatter(data[key]),
      }) as ColumnDef<typeof data>,
  );

const Table = () => {
  const [tableData, setTableData] = useState(fallbackdata);
  const [columnsSettings, setColumnSettings] = useState(setDefaultColumns(tableData[0]));

  const onHandlePreview = () => {
    const reader = new FileReader();
    const file = document.querySelector<HTMLInputElement>('input[type="file"]')!.files![0];
    if (file) {
      reader.readAsArrayBuffer(file);
    }
    reader.onload = async function () {
      if (reader.result) {
        const parser = parse(Buffer.from(reader.result as ArrayBuffer), {
          comment: "#",
          columns: true,
          relax_quotes: true,
          escape: '"',
          delimiter: ";",
          skip_empty_lines: true,
          relax_column_count: true,
        });
        const parsedData = [];
        for await (const record of parser) {
          const item = {} as Record<string, unknown>;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.entries(record).forEach(([key, value]) => {
            item[key] = value as string;
          });
          parsedData.push(item);
        }
        setTableData(parsedData);
        setColumnSettings(setDefaultColumns(parsedData[0]));
      }
    };
  };

  const onHandleCellFormat = (index: number, fn: (props: { getValue: () => string | number }) => JSX.Element) => {
    const newColumnSettings = [...columnsSettings];
    newColumnSettings[index] = {
      ...newColumnSettings[index],
      cell: fn,
    } as ColumnDef<(typeof tableData)[0]>;
    setColumnSettings(newColumnSettings);
  };

  const table = useReactTable({
    columns: columnsSettings,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mt-12">
      <div className="flex justify-center">
        <form className="join justify-center">
          <input
            type="file"
            name="file"
            accept=".csv"
            className="file-input join-item file-input-bordered w-full max-w-xs"
          />
          <button className="btn btn-primary join-item" type="button" onClick={onHandlePreview}>
            Preview
          </button>
        </form>
      </div>
      <table className="table table-zebra mt-8 bg-rose-50">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="text-center capitalize" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  <div className="">
                    <div className="dropdown dropdown-hover">
                      <div tabIndex={0} role="button" className="btn btn-xs">
                        Select type
                      </div>
                      <ul tabIndex={0} className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
                        {Object.keys(CELL_FORMATTERS).map((key) => (
                          <li
                            key={`${header.id}_${key}`}
                            className="cursor-pointer text-left font-normal"
                            onClick={() =>
                              onHandleCellFormat(header.index, CELL_FORMATTERS[key as keyof typeof CELL_FORMATTERS])
                            }
                          >
                            {key}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <details>
        <summary>Raw data</summary>
        <div className="mt-4 flex gap-4">
          <div className="mockup-code w-full">
            <pre className="max-h-96 overflow-auto whitespace-break-spaces pl-5">
              {JSON.stringify(tableData, undefined, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
};

export default Table;
