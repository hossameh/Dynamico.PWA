export interface API {
  data: any;
  isPassed: boolean;
  message: string;
}

export interface dates {
  date: Date;
  list: list[]
}

export interface list {
  id:                      number;
  title:                   string;
  startDate:               Date;
  endDate:                 Date;
  mode:                    string;
  color:                   string;
  days:                    string;
  userId:                  number;
  usersId:                 null;
  formId:                  number;
  companyId:               number;
  isCreateFormData:        boolean;
  is_Need_Delete_FormData: boolean;
  plannerFormsData:        null;
  company:                 null;
  user:                    null;
  form:                    null;
  createdBy:               number;
  creationDate:            Date;
  updatedBy:               null;
  lastUpdateDate:          null;
  isDeleted:               boolean;
}



export interface Planner {
  color?: string;
  title?: string;
  id?: number;
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  formId?: number;
  companyId?: number;
  mode?: string;
  days?: string;
  usersId?: number[];
  isCreateFormData: boolean;
  Is_Need_Delete_FormData?: boolean;
  user?: any;
}

export interface RecurringEvent {
  id: number;
  title: string;
  color: any;
  rrule?: {
    freq: any;
    bymonth?: number;
    bymonthday?: number;
    byweekday?: any;
    dtstart?: any;
    until?: any;
    interval?: any;
  };
}
