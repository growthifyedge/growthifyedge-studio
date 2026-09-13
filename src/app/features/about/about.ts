import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/components/icon/icon';
@Component({selector:'ge-about',standalone:true,changeDetection:ChangeDetectionStrategy.OnPush,imports:[RouterLink,Icon],templateUrl:'./about.html'}) export class About {}
