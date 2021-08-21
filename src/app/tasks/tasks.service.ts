import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth';
import { firebase } from '../firebase';
import { ITask, Task } from './models';


@Injectable()
export class TasksService {
  visibleTasks$: Observable<ITask[]>;

  private filter$: ReplaySubject<any> = new ReplaySubject(1);
  private filteredTasks$: AngularFireList<ITask[]>;
  private tasks$: AngularFireList<ITask[]>;


  constructor(afDb: AngularFireDatabase, auth: AuthService) {
    auth.uid$
      .pipe(take(1))
      .subscribe(uid => {
        const path = `/tasks/${uid}`;

        this.tasks$ = afDb.list(path);

        this.filteredTasks$ = afDb.list(path, ref => 
          ref.orderByChild('completed').equalTo(this.filter$));

        this.visibleTasks$ = this.filter$;

          //.pipe(switchMap(filter => filter === null ? this.tasks$.valueChanges() : this.filteredTasks$.valueChanges()));
      });
  }


  filterTasks(filter: string): void {
    switch (filter) {
      case 'false':
        this.filter$.next(false);
        break;

      case 'true':
        this.filter$.next(true);
        break;

      default:
        this.filter$.next(null);
        break;
    }
  }

  createTask(title: string): firebase.Promise<any> {
    return this.tasks$.push([new Task(title)]);
  }

  removeTask(task: ITask): firebase.Promise<any> {
    return this.tasks$.remove(task.$key);
  }

  updateTask(task: ITask, changes: any): firebase.Promise<any> {
    return this.tasks$.update(task.$key, changes);
  }
}
