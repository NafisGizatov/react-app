import React, { MouseEvent as reactMouseEvent} from 'react';
import * as convert from 'xml-js';

interface IProps {
}

interface IParcedString {
  _text: string;
}

interface IState {
  isBlured: boolean;
  collapsed: boolean;
  windowHeight: number;
  windowWidth: number;
  windowTop: number;
  windowLeft: number;
  windowDragAndDrop: boolean;
  isClosed: boolean;
  zIndex: number;
  question: Partial<{
    BeforeQuestion?: string;
    Question: IParcedString;
    Answer: IParcedString;
    Comments: IParcedString;
    Author: IParcedString;
    Pic?: string;
  }>;
}

let commonZindex = 1;

class WindowXP extends React.Component<IProps, IState> {
  private _position: {dX: number, dY: number};

    constructor(props: object) {
      super(props);
        this.state = {
            isBlured: false,
            collapsed: false,
            question: {},
            zIndex: ++commonZindex,
            isClosed: false,
            windowHeight: 300,
            windowWidth: 500,
            windowTop: 8,
            windowLeft: 80,
            windowDragAndDrop: false
        }
        this._position = {
            dX: 0,
            dY: 0
        }
    }

    async componentDidMount(): Promise<void> {
      var xhr = new XMLHttpRequest()
      xhr.open("GET", 'https://db.chgk.info/xml/random/from_2012-01-01/limit1/', true);
      xhr.onload = () => {
        if (xhr.readyState === 4){
          if (xhr.status === 200){
            const answer = convert.xml2js(xhr.response, {compact: true}) as {search: any};
            const question = answer?.search?.question;
            let qText = question?.Question?._text.replace(/\r?\n/g, ' ');

            const BEFORE_QUEST_REGEXP = /(.*?)<раздатка>(.*?)<\/раздатка>/;
            const beforeQuestionArr = qText.match(BEFORE_QUEST_REGEXP);
            console.log(beforeQuestionArr);
            const PIC_REGEXP = /\(pic: (.*)\)/;
            const picArr = qText.match(PIC_REGEXP);

            if (beforeQuestionArr?.length) {
              question.BeforeQuestion = beforeQuestionArr[2];
              qText = qText.replace(beforeQuestionArr[0], '');
            }

            if (picArr?.length) {
              question.Pic = picArr[1];
              qText = qText.replace(picArr[0], '');
            }

            question.Question._text = qText;
            if (question) {
              this.setState({
                question: question
              })
            }


          } else {
            console.error(xhr.statusText)
          }
        }
      }
      xhr.onerror = function(){
        console.error(xhr.statusText)
      }
      xhr.send(null);
      window.addEventListener('reculcIndex', this._reculcIndex);
      this._updateIndex();
    }

    activate = () => {
      this._updateIndex();
      this.setState({
        isBlured: false,
        zIndex: ++commonZindex
      })
    }

    private _onMouseDown = (event: reactMouseEvent<HTMLDivElement, MouseEvent>) => {
      event.persist();
      this._position = {
        dX: event.clientX - this.state.windowLeft,
        dY: event.clientY - this.state.windowTop
      }
      this.setState({
        isBlured: false,
        zIndex: ++commonZindex,
        windowDragAndDrop: true
      })
    }

    private _onMouseUp = () => {
      this.setState({
        windowDragAndDrop: false
      });
    }

    private _onMouseMove= (event: reactMouseEvent<HTMLDivElement, MouseEvent>) => {
      event.persist();
      if (this.state.windowDragAndDrop) {
        this.setState({
          windowTop: event.clientY - this._position.dY,
          windowLeft: event.clientX - this._position.dX
        })
      }
    }

    private _getWindowStyle(): object {
      return {
        width: this.state.windowWidth,
        height: this.state.windowHeight,
        top: this.state.windowTop,
        left: this.state.windowLeft,
        zIndex: this.state.zIndex
      }
    }

    private _onClose = () =>{
        this.setState({
          isClosed: true
        })
    }

    private _toggleCollaps = () => {
      this.setState({
        collapsed: !this.state.collapsed
      });
    }

    private _reculcIndex = () => {
      this.setState({
        isBlured: this.state.zIndex !== commonZindex
      });
    }

    private _updateIndex = () => {
      window.dispatchEvent(new CustomEvent('reculcIndex'));
    }

    render() {
        return (
          <div className={
            (this.state.isBlured ? 'is-blured' : '') +
            " window_XP " + (this.state.isClosed ? 'is-hidden' : '')
          }
          onClick={this._updateIndex}
           style={this._getWindowStyle()}>
            <div className={"windowBar " + (this.state.windowDragAndDrop ? 'cursor-pointer' : '')}
                onMouseDown={this._onMouseDown}
                onMouseUp={this._onMouseUp} 
                onMouseMove={this._onMouseMove}
                onMouseLeave={this._onMouseUp} 
            >   
            <div className="closeButton cursor-pointer" onClick={this._onClose}>X</div>
            </div>
            <div className="windowMain" onMouseDown={this.activate}>
              <div className="question">
                {this.state.question.Pic ? <div className="QuestionPic"><img alt={this.state.question.Pic} src={"https://db.chgk.info/images/db/" + this.state.question.Pic}/></div> : ''}
                {this.state.question.BeforeQuestion ? <div className="BeforeQuestion">{this.state.question.BeforeQuestion}</div> : ''}
                {this.state.question.Question?._text}
              </div>
              <div className="">
                <span onClick={this._toggleCollaps} className="cursor-pointer">&#10157; ... </span>
                <span className={"answer " + (this.state.collapsed ? '' : 'is-hidden')}>{this.state.question.Answer?._text}</span>
                <div className={this.state.collapsed ? '' : 'is-hidden'}>
                  {this.state.question.Comments?._text}
                </div>
              </div>
            </div>
            <div className="windowFooter"></div>
          </div>
        );
      }
}

export default WindowXP;