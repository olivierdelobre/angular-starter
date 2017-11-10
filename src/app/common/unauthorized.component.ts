import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div style="text-align: center; padding: 20px;">
      <span class="glyphicon glyphicon-eye-close" style="font-size: 150%;"></span>
      <br />
      Vous n'êtes pas authentifié ou n'avez pas les droits requis pour visualiser cette page.
    </div>
  `
})
export class UnauthorizedComponent {

}
