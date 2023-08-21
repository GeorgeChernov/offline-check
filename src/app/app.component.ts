import { ApplicationRef, Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Network } from '@ngx-builders/pwa-offline';
import { Observable, fromEvent, map, merge, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  initialCheck = '';
  networkStatus$: Observable<boolean>;
  networkStatusLib$: Observable<boolean>;

  constructor(protected network: Network) {
    this.initialCheck = navigator.onLine.toString();

    this.networkStatusLib$ = this.network.onlineChanges;

    this.networkStatus$ = merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));
  }

  // constructor(private appRef: ApplicationRef, private updates: SwUpdate) {
  //   this.appRef.isStable.subscribe((isStable) => {
  //     console.log(`ApplicationRef::stable`, isStable);
  //     console.log(new Date());
  //   });

  //   this.updates.versionUpdates.subscribe((evt) => {

  //     console.log('evt', evt);

  //     this.title = this.title + ' ' + evt.type;

  //     switch (evt.type) {
  //       case 'VERSION_DETECTED':
  //         console.log(`Downloading new app version: ${evt.version.hash}`);
  //         break;
  //       case 'VERSION_READY':
  //         console.log(`Current app version: ${evt.currentVersion.hash}`);
  //         console.log(
  //           `New app version ready for use: ${evt.latestVersion.hash}`
  //         );
  //         break;
  //       case 'VERSION_INSTALLATION_FAILED':
  //         console.log(
  //           `Failed to install app version '${evt.version.hash}': ${evt.error}`
  //         );
  //         break;
  //     }
  //   });
  // }
}
