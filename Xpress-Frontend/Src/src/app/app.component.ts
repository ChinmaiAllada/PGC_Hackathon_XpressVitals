import { Component} from '@angular/core';
import { ApiService } from './services/api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { DateComponent } from './components/date/date.component';
import { DepartmentDropdownComponent } from './components/department/department.component';
import { CardTableComponent } from './components/table/card-table.component';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, DateComponent, DepartmentDropdownComponent, CardTableComponent],
})

export class AppComponent{
	title = 'XpressVitals-frontend';
	message: string | undefined;
   
	constructor(private apiService: ApiService) {}
   
	ngOnInit() {}
   
	fetchMessage() {
	  this.apiService.getHello().subscribe((data) => {
		this.message = data.message;
	  });
	}
}


