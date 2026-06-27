import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})

export class EmployeeList implements OnInit {

  private employeeService = inject(EmployeeService);
  private formBuilder = inject(FormBuilder);

  employees = signal<Employee[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isDeleting = signal<number | null>(null);
  editingEmployeeId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');
  employeeCount = computed(() => this.employees().length);
  formTitle = computed(() => this.editingEmployeeId() ? 'Update Employee' : 'Save Employee');
  submitLabel = computed(() => {
    if (this.isSaving()) {
      return this.editingEmployeeId() ? 'Updating...' : 'Saving...';
    }

    return this.editingEmployeeId() ? 'Update Employee' : 'Save Employee';
  });

  employeeForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    department: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.employeeService.getAllEmployees()
      .subscribe({
        next: (data) => {
          this.employees.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('API Error:', err);
          this.errorMessage.set('Unable to load employees. Check that the Spring Boot backend is running on port 8080.');
          this.isLoading.set(false);
        }
      });
  }

  saveEmployee(): void {
    this.employeeForm.markAllAsTouched();
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.employeeForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    const employee = this.employeeForm.getRawValue();
    const editingId = this.editingEmployeeId();
    const request = editingId
      ? this.employeeService.updateEmployee(editingId, employee)
      : this.employeeService.createEmployee(employee);

    request
      .subscribe({
        next: () => {
          this.resetForm();
          this.successMessage.set(editingId ? 'Employee updated successfully.' : 'Employee saved successfully.');
          this.isSaving.set(false);
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Save Error:', err);
          this.errorMessage.set('Unable to save employee. Check that the Spring Boot backend is running on port 8080.');
          this.isSaving.set(false);
        }
      });
  }

  editEmployee(employee: Employee): void {
    if (!employee.id) {
      return;
    }

    this.editingEmployeeId.set(employee.id);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.employeeForm.setValue({
      name: employee.name,
      department: employee.department,
    });
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id || !confirm(`Delete ${employee.name}?`)) {
      return;
    }

    this.isDeleting.set(employee.id);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.employeeService.deleteEmployee(employee.id)
      .subscribe({
        next: () => {
          if (this.editingEmployeeId() === employee.id) {
            this.resetForm();
          }

          this.successMessage.set('Employee deleted successfully.');
          this.isDeleting.set(null);
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Delete Error:', err);
          this.errorMessage.set('Unable to delete employee. Check that the Spring Boot backend is running on port 8080.');
          this.isDeleting.set(null);
        }
      });
  }

  resetForm(): void {
    this.employeeForm.reset();
    this.editingEmployeeId.set(null);
  }
}
