import React from 'react';
import WindowXP from './window';

interface IProps {
}

interface IState {
  windows: any
}

class Main extends React.Component<IProps, IState> {
    constructor(props: object) {
      super(props);
        this.state = {
            windows: []
        }
    }

    private _onClick = () => {
      const NewWindowlement = React.createElement(WindowXP, {
          key: Math.random().toString()
      });    
      this.setState({
        windows: this.state.windows.concat([NewWindowlement])
      })
    }

    private _getWindows(): any {
      return <div className="MainWindow">
          {[<div className="addButton" key="adddBtn" onClick={this._onClick}>+</div>].concat(this.state.windows)}
        </div>
    }

    render() {
        return this._getWindows();
      }
}

export default Main;