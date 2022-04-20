import './App.css';
import React, {Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from "react-tsparticles";

const initialState = {
  input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id:'',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
}
class App extends Component {
  constructor() {
    super();
    this.state = initialState;  
  }

  loadUser = (data) => {
    this.setState({ user: {
       id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }


 calculateFaceLocation = (response) => {
    const clarifaiFace = response.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width,height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
 }


 displayFaceBox = (box) => {
  console.log(box);
  this.setState({box: box});
 }


  onInputChange = (event) => {
    console.log(event.target.value);
    this.setState({input: event.target.value});


  }

  onSubmit = () => {
    // console.log('click!');
    this.setState({imageUrl: this.state.input});
    fetch('https://still-basin-96770.herokuapp.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            input: this.state.input
      })
          })
    .then(response => response.json())
    .then( response => {
      if(response) {
          fetch('https://still-basin-96770.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
            id: this.state.user.id
      })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log('something went wrong!', err))
  }

  onRouteChange = (route) => {
    console.log(route);
    if(route === 'signout') {
      this.setState(initialState);
    } else if (route ==='home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render(){
    const {box, route, imageUrl, isSignedIn } = this.state;
    return (
      <div className="App">
        <Particles className="particles"
          id="tsparticles"
          // init={particlesInit}
          // loaded={particlesLoaded}
          options={{
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                bubble: {
                  distance: 400,
                  duration: 2,
                  opacity: 0.8,
                  size: 40,
                },
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              collisions: {
                enable: true,
              },
              move: {
                direction: "none",
                enable: true,
                outMode: "bounce",
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 100,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                random: true,
                value: 2,
              },
            },
            detectRetina: true,
          }}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      {route === 'home' 
          ? <div> 
              <Logo />
              <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
              <FaceRecognition box = {box} imageUrl = {imageUrl} />
            </div>
          : (route === 'signin' ? <Signin loadUser = {this.loadUser} onRouteChange = {this.onRouteChange} />
              : <Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange} /> )
      }
      </div>
    );
  }
}

export default App;
