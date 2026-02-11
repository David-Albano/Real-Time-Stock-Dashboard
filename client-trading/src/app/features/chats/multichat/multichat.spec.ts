import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Multichat } from './multichat';

describe('Multichat', () => {
  let component: Multichat;
  let fixture: ComponentFixture<Multichat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Multichat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Multichat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
