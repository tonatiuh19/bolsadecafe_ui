import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-coming-soon',
  standalone: false,
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.css',
})
export class ComingSoonComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('¡Próximamente! | Bolsa de Café');
  }
}
