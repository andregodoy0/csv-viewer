"use client";

import { parse } from "csv-parse";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const initialData = [
  { test: "1 string", value: 1 },
  { test: "2 string", value: 2 },
  { test: "3 string", value: 3 },
  { test: "4 string", value: 4 },
  { test: "5 string", value: 5 },
] as Record<string, unknown>[];

const Table = () => {
  const [tableData, setTable] = useState(initialData);

  const onHandlePreview = () => {
    const reader = new FileReader();
    const file =
      document.querySelector<HTMLInputElement>('input[type="file"]')!.files![0];
    if (file) {
      reader.readAsArrayBuffer(file);
    }
    reader.onload = async function () {
      console.log(reader.result);
      if (reader.result) {
        const parser = parse(Buffer.from(reader.result as ArrayBuffer), {
          comment: "#",
          columns: true,
          relax_quotes: true,
          escape: '"',
          delimiter: ";",
          record_delimiter: "\n",
          skip_empty_lines: true,
          relax_column_count: true,
        });
        const tableData = [];
        for await (const record of parser) {
          const item = {} as Record<string, unknown>;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.entries(record).forEach(([key, value]) => {
            item[key] = value as string;
          });
          tableData.push(item);
          if (tableData.length > 5) {
            break;
          }
        }
        setTable(tableData);
        console.log(tableData);
      }
    };
  };

  const table = useReactTable({
    columns: Object.keys(tableData[0] ?? {}).map((key) => ({
      header: key,
      accessorKey: key,
    })),
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
          <button
            className="btn btn-primary join-item"
            type="button"
            onClick={onHandlePreview}
          >
            Preview
          </button>
        </form>
      </div>
      <table className="table-zebra mt-8 table border-cyan-600">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="text-center capitalize" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      <div className="mockup-code mt-8">
        <pre className="max-h-96 overflow-auto whitespace-break-spaces pl-5">
          {JSON.stringify(tableData)}
        </pre>
      </div>
    </div>
  );
};

export default Table;
