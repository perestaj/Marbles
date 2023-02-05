import { IonCol, IonContent, IonGrid, IonPage, IonRow, IonText, withIonLifeCycle } from '@ionic/react';
import React from 'react';
import { Subscription } from 'rxjs';
import { Game, CellsCount } from '../game/game';
import { GameState } from '../game/game-state';
import './Home.css';

type Props = { }

type State = {
  score: number;  
  mapWidth: number;
  mapHeight: number;
  infoVisible: boolean;
}

export class Home extends React.Component<Props, State> {  
  private scoreUpdatedSubscription!: Subscription;
  private gameStateChangedSubscription!: Subscription;

  private gameState: GameState = GameState.Stopped;

  public mapWidth = 0;
  public mapHeight = 0;
  public score = 0;
  public info = '';
  public infoVisible = false;

  public contentDivRef: React.RefObject<HTMLDivElement>;
  public gridRef: React.RefObject<HTMLDivElement>;
  public mapRef: React.RefObject<HTMLDivElement>;
  public canvasRef: React.RefObject<HTMLCanvasElement>;
  public canvasContext!: CanvasRenderingContext2D | null;

  public game: Game | undefined;

  constructor(props: any) {
    super(props);

    this.contentDivRef = React.createRef();
    this.gridRef = React.createRef();
    this.mapRef = React.createRef();
    this.canvasRef = React.createRef();

    this.state = {
      score: 0,      
      mapWidth: 0,
      mapHeight: 0,
      infoVisible: true
    };

    this.info = "Tap to start the game";
  }  

  public ionViewDidEnter(): void {    
    const canvasPanelHeight = (this.contentDivRef.current?.offsetHeight || 0) - (this.gridRef.current?.offsetHeight || 0);
    const width = Math.floor((this.contentDivRef.current?.offsetWidth || 0) / CellsCount) * CellsCount;
    const height = Math.floor(canvasPanelHeight / CellsCount) * CellsCount;
    
    const minimum = Math.min(width, height);
    const mapWidth = minimum;
    const mapHeight = minimum;

    this.setState({       
      mapWidth: mapWidth,
      mapHeight: mapHeight
    }); 
        
    if (this.canvasRef && this.canvasRef.current) {
      this.canvasContext = this.canvasRef.current.getContext("2d");
      this.game = new Game(mapWidth, mapHeight, this.canvasContext!, (score: number) => {this.setState({ score })}, this.stateChanged.bind(this));      
    }    
  }

  private stateChanged(state: GameState): void {
    if (state === GameState.Started) {
      this.setState({ infoVisible: false });          
    } else if (state === GameState.Stopped) {
      this.info = 'Game Over :(';
      this.setState({ infoVisible: true });     
    }

    this.gameState = state;
  }

  public componentWillUnmount(): void {
    if (this.scoreUpdatedSubscription) {
      this.scoreUpdatedSubscription.unsubscribe();
    }

    if (this.gameStateChangedSubscription) {
      this.gameStateChangedSubscription.unsubscribe();
    }
  }

  public render(): JSX.Element {
    let infoDiv = this.state.infoVisible ? 
    <div className="info-panel" style={{ height: this.state.mapHeight + 'px' }} onClick={(e) => this.mapClicked(e)}><div className="info">{this.info}</div></div> :
      '';
    return (
      <IonPage>      
        <IonContent fullscreen>
          <div ref={this.contentDivRef} className="content">
            <div ref={this.gridRef}>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonText className="score-label">
                      <h1>Score:</h1>
                    </IonText>
                  </IonCol>
                  <IonCol>
                    <IonText className="score">
                      <h1>{this.state.score}</h1>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </div>
            <div ref={this.mapRef} className="map">
              {infoDiv}
              <div className="canvas-panel" style={{ height: this.state.mapHeight + 'px', width: this.state.mapWidth + 'px' }}>   
                <canvas className="game-canvas" style={{opacity: this.state.infoVisible ? '0.4' : '1'}} ref={this.canvasRef} 
                  width={this.state.mapWidth} height={this.state.mapHeight} onClick={(e) => this.canvasClicked(e)}>                  
                </canvas>
              </div>
            </div>
          </div>   
        </IonContent>
      </IonPage>
    );
  } 
  
  public mapClicked(ev: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    ev.stopPropagation();
    
    if (this.gameState === GameState.Stopped) {
      this.game?.start();      
    }
  }

  private canvasClicked(ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    ev.stopPropagation();

    if (this.gameState === GameState.Stopped) {
      this.game?.start();      
    } else {
      this.game?.mapTouched(ev.nativeEvent.offsetX, ev.nativeEvent.offsetY);
    }    
  }
}

export default withIonLifeCycle(Home);