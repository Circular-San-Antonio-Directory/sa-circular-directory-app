export const AIRTABLE_TABLES = {
  businesses:           { name: 'Production DB',        id: 'tblujaqw04RqX2j3P' },
  businessActions:      { name: 'Business Actions',     id: 'tblgqINSWO2dbU47G' },
  categories:           { name: 'Categories',           id: 'tblBbF9twnZYHd8jz' },
  businessTypes:        { name: 'Business Type',        id: 'tbl6I6Lv3Tie1v5f3' },
  coreMaterialSystems:  { name: 'Core Material System', id: 'tbl9CXIR5KUnby3el' },
  tags:                 { name: 'Tag',                  id: 'tblFGOQaD3M8uffIq' },
  businessActivities:   { name: 'Business Activity',   id: 'tblhVXx855N83v61I' },
  enablingSystems:      { name: 'Enabling Systems',     id: 'tbl2LvLDN92wihXrk' },
} as const;

export type AirtableTableKey = keyof typeof AIRTABLE_TABLES;
