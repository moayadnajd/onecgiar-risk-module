import { Pipe } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({name: 'safeHtml'})
export class Safe {
  constructor(private sanitizer:DomSanitizer){}

  transform(style:any) {
    return this.sanitizer.bypassSecurityTrustHtml(style);
    //return this.sanitizer.bypassSecurityTrustStyle(style);
    // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
  }
}