import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-help',
  providers: [ ],
  styleUrls: [ './help.style.css', '../app.style.css' ],
  templateUrl: './help.template.html'
})
export class HelpComponent implements OnInit, OnDestroy {

  constructor(
    public router: Router
  )
  { }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() { }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    
  }
}
