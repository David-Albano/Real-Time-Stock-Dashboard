import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Navbar } from "../../components/navbar/navbar";

@Component({
    selector: 'app-main-layout',
    standalone: true, 
    imports: [RouterOutlet, Navbar],
    templateUrl: 'main_layout.html', 
    styleUrl: 'main_layout.css' 
})
export class MainLayout {}