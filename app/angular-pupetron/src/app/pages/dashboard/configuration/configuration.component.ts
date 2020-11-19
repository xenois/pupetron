import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ElectronService } from 'src/app/services/electron.service';
export interface BlenderObject {
  position: number;
  name: string;
  type?: string;
}

const BLENDER_DATA: BlenderObject[] = [
  { position: 0, name: 'Hydrogen', type: 'Armature' },
  { position: 1, name: 'Helium', type: 'He' },
  { position: 2, name: 'Lithium', type: 'Li' },
  { position: 3, name: 'Beryllium', type: 'Be' },
  { position: 4, name: 'Boron', type: 'B' },
  { position: 5, name: 'Carbon', type: 'C' },
  { position: 6, name: 'Nitrogen', type: 'N' },
  { position: 7, name: 'Oxygen', type: 'O' },
  { position: 8, name: 'Fluorine', type: 'F' },
  { position: 9, name: 'Neon', type: 'Ne' },
];

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ConfigurationComponent{
  displayedColumns: string[] = ['select', 'name', 'color'];
  dataSource = new MatTableDataSource<BlenderObject>(BLENDER_DATA);
  selection = new SelectionModel<BlenderObject>(true, []);
  connState = 0;
  constructor(private electronService: ElectronService) {

    electronService.socketDataBus.subscribe((packet) => {
      if (packet.direction === 0) {
        return;
      }
      if (packet.data.type === 'control') {
        this.connState = 0;
        if (packet.data.data.action === 'connected') {
          this.connState = 2;
        } else {
          this.connState = 0;
          this.clearBlenderObjects();
        }
      } else if (packet.data.type === 'data') {
        switch (packet.data.data.event) {
          case 'getSelected':
            this.setBlenderObjects(packet.data.data.selections);
            break;
        }
      }
    });
  }
  clearBlenderObjects() {
    this.dataSource.data = [];
  }
  setBlenderObjects(selections: string[]) {
    const data: BlenderObject[] = [];
    selections.forEach((value, index) => {
      data.push({ position: index, name: value });
    });
    this.dataSource.data = data;
  }
  onGetSelections() {
    this.electronService.socketDataBus.next({ direction: 0, data: { type: 'data', data: { event: 'getSelected' } } });
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: BlenderObject): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  setTraceColor(color, row: BlenderObject) {
    console.log(color);
    console.log(row);
  }
  onDrop(event){
    console.log(event);
    }
}
