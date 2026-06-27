import { Routes } from '@angular/router';
import { EmployeeList } from './components/employees/employee-list/employee-list';

export const routes: Routes = [
  {
    path:'',
    redirectTo:'employees',
    pathMatch:'full'
  },
  {
    path:'employees',
    component: EmployeeList
  }
];
