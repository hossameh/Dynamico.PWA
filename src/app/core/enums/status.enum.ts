// export enum RecordStatus {
//   Pendding = 1,
//   Complete = 2,
// }

export enum RecordStatus {
  Created = 1,
  Completed = 2,
  Assigned = 3,
  PendingApproval = 4,
  Approved = 5,
  Rejected = 6
}
export enum RecordStatusNames {
  Created = "Created",
  Completed = "Completed",
  Assigned = "Assigned",
  PendingApproval = "PendingApproval",
  Approved = "Approved",
  Rejected = "Rejected"
}

export enum WorkflowStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}
