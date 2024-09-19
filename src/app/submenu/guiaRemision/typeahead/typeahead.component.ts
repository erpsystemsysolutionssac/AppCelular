import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { OnInit } from '@angular/core';
import { ToolsService } from 'src/app/service/tools.service';

@Component({
  selector: 'app-typeahead',
  templateUrl: 'typeahead.component.html',
})
export class TypeaheadComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() title = 'Select Items';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  filteredItems: any[] = [];

  constructor(
    private toolsService: ToolsService
  ){}

  async ngOnInit() {
    let idLoading = await this.toolsService.mostrarCargando()
    this.filteredItems = [...this.items];
    await this.toolsService.ocultarCargando(idLoading)
  }

  trackItems(index: number, item: any) {
    return item.Codigo;
  }

  cancelChanges() {
    this.selectionCancel.emit();
  }

  confirmChanges(data) {
    this.selectionChange.emit(data);
  }

  searchbarInput(ev) {
    this.filterList(ev.target.value);
  }

  filterList(searchQuery: string | undefined) {

    if (searchQuery === undefined) {
      this.filteredItems = [...this.items];
    } else {

      const normalizedQuery = searchQuery.toLowerCase();
      this.filteredItems = this.items.filter((item) => {
        return item.Nombre.toLowerCase().includes(normalizedQuery);
      });
    }
  }
}