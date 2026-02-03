export type Column = {
  name: string;
  null: boolean;
  type: number;
}

export type TableDescription = {
  table: string;
  columns: Column[];
}

export type TableDescriptionMeta = {
    table: string;
    description : TableDescription;
}


export type Tables = {
    tables: string[] ;
}

export type TableDataResponse = {
    data: any[];
    total: number;
    page: number;
    pageSize: number;
}

 export const TypeMap: { [key: number]: string } = {
      16: 'boolean',
      20: 'bigint',
      21: 'smallint',
      23: 'integer',
      25: 'text',
      700: 'real',
      701: 'double precision',
      1043: 'varchar',
      1082: 'date',
      1083: 'time',
      1184: 'timestamp',
      1700: 'numeric'
    };



export const TypeMapJS: { [key: string]: string } = {
      'boolean': 'boolean',
      'bigint': 'number',
      'smallint': 'number',
      'integer': 'number',
      'text': 'string',
      'real': 'number',
      'double precision': 'number',
      'varchar': 'string',
      'date': 'string',
      'time': 'string',
      'timestamp': 'string',
      'numeric': 'number'
};


export type ColumnType =
  | 'boolean'
  | 'varchar'
  | 'text'
  | 'int'
  | 'float'
  | 'date'
  | 'timestamp';