import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';


@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
	standalone: true,
	imports: [],
})

export class HeaderComponent implements OnInit {
	image!: SafeResourceUrl;
	title = 'Providence - Reduce Admin Burden (POC)';

	constructor(
		private http: HttpClient,
		private domSanitizer: DomSanitizer,
	) {
	}

	ngOnInit(): void {
		// Get the profile picture, smallest one please
		this.http.get('https://graph.microsoft.com/v1.0/me/photos/48x48/$value', { responseType: 'blob' })   //  ### MAKE CONFIGURATION ###
			.subscribe(res => {
				const imageUrl = window.URL.createObjectURL(res);
				const sanitizedImage = this.domSanitizer.bypassSecurityTrustResourceUrl(imageUrl);
				this.image = sanitizedImage;
			});
		}
}