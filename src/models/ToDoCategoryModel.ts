export interface ToDoCategoryModel {
  id: string;
  name: string;
}

export const toDoCategories: ToDoCategoryModel[] = [
  {
    name: 'Inbox',
    id: '1',
  },
  {
    name: 'Archive',
    id: '2',
  },
];
