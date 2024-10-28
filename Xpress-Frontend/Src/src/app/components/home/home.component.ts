import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	standalone: true,
	imports: [CommonModule, RouterModule],
})


export class HomeComponent implements OnInit {

	allowImpersonation = true; //  ### MAKE CONFIGURATION ###
	impersonationSelectedUser = '';

	preferredName = '';

	ngOnInit(): void {
		// Wait for the preferred first name from 'me view'

		// If we want impersonation, get a list of all the managers under Doug Lewis (506291) and Vasudha Bommireddy (800118)
	
	}


}
