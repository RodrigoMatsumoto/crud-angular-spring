import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';

import { ErrorDialogComponent } from '../../../shared/components/error-dialog/error-dialog.component';
import { Course } from '../../model/course';
import { CoursesService } from '../../services/courses.service';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {

  courses$ : Observable<Course[]> | null = null;


  constructor(
    private coursesService : CoursesService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
    ) {
    this.refresh();
  }

  refresh() {
    this.courses$ = this.coursesService.list()
    .pipe(
      catchError(error => {
        this.OnError('Erro ao carregar cursos.')
        return of([])
      })
    );
  }

  OnError(errorMsg: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMsg
    });
  }

  onAdd() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onEdit(course: Course) {
    this.router.navigate(['edit', course.id], { relativeTo: this.route });
  }

  onRemove(course: Course) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'Tem certeza que deseja remover esse curso?',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.coursesService.remove(course.id).subscribe(
          () => {
            this.refresh();
            this.snackBar.open('Curso removido com sucesso', 'X',
             {duration: 5000,
              verticalPosition:'top',
              horizontalPosition:'center'
            });
          },
          () => this.OnError('Erro ao tentar remover curos.')
        );
      }
    });
  }
}
