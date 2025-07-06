export enum Role {
    User = "User",
  Anonymous = 'Anonymous',
  CompanyAdmin = 'CompanyAdmin',
  FormCreator = 'FormCreator',
  Customer = "Customer",
}
export enum ContainerControlTypesEnum {
  columns = "columns",
  table = "table",
  well = "well",
  tabs = "tabs",
  panel = "panel",
  fieldset = "fieldset"
};
export enum labeledTypes {
  content = "content",
  button = "button"
} export enum ControlTypeEnum {
  textfield = "textfield", // 3 x y  -9
  textarea = "textarea",// 3  x y
  number = "number",// 3 x y         -9 
  password = "password", // 3 
  checkbox = "checkbox", // 3 x  -9
  selectboxes = "selectboxes", // filter 
  select = "select", //  filter x y  -9 single select
  radio = "radio", // 3 x y
  email = "email",// 3 x y  -9
  url = "url", // 3 x y   -9
  phoneNumber = "phoneNumber", // 3 x y  -9
  tags = "tags", // filter  
  address = "address", //filter x y
  datetime = "datetime", //3 x y   -9
  day = "day", //3 x y       -9
  time = "time", //3 x y     -9
  currency = "currency", // 3 x y  
  survey = "survey", //0
  signature = "signature", //0 
  file = "file", //0,
  datagrid = "datagrid",
  preserved = "preserved", // 3
  rate = "rate", //  -9
  googlecaptcha = "googlecaptcha",
  appointment = "appointment",  // -9
  selectGroup = "selectGroup", // x y
  workflowStage = "workflowStage",
  hidden = "hidden"
};

