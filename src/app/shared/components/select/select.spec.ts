import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { Select } from './select';
import { DataService } from '../../../services/http/data.service';
import { InfiniteScrollDirective } from '../../directives/infinite-scroll/infinite-scroll.directive';

describe('Select', () => {
  let component: Select;
  let fixture: ComponentFixture<Select>;
  const dataServiceMock = {
    getTableData: () => of({ message: { data: [], total: 0, page: 1, pageSize: 20 } })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Select, InfiniteScrollDirective],
      imports: [CommonModule, FormsModule],
      providers: [{ provide: DataService, useValue: dataServiceMock }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Select);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
