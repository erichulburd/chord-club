import * as React from 'react';
import Card from 'react-bootstrap/Card';
import {VideoContainer} from './VideoContainer';

const TUTORIAL_LINK = 'https://www.youtube.com/watch?v=hi8VVPaW0eQ';

class Home extends React.Component {

  public render() {
    return (
      <div id="home">
        <Card>
          <Card.Body>
            <div
              style={{width: '100%', margin: '20px 0px', textAlign: 'center'}}
            >
              <div
                style={{ maxWidth: '800px', margin: 'auto' }}
              ><VideoContainer src={TUTORIAL_LINK}></VideoContainer></div>
            </div>
            <h3>What is it?</h3>
            <p>Chord Club allows you to record audio and annotate your sounds for later reference or in order to test your musical ear. We include the following functionality:</p>
            <ul>
              <li>Record audio clips up to 5 minutes.</li>
              <li>Add tone, quality, and extension annotations to the recordings.</li>
              <li>Upload a photo of sheet music with the recording.</li>
              <li>Tag your recordings so you can review groups of relevant recordings at once.</li>
              <li>Test your musical ear with flashcards.</li>
            </ul>
            <p>Two important notes about current limitations:</p>
            <ul>
              <li>You cannot create sheet music directly within the app.</li>
              <li>This is not meant for recording production quality audio.</li>
            </ul>
            <h3>Try it out!</h3>
            <p>
              While we're ironing out our initial launch, your feedback would be greatly appreciated.
            </p>
            <h4>iPhone and iPad</h4>
            <p>
              You can download our app onto your iPhone or iPad by installing the <a href="https://apps.apple.com/us/app/testflight/id899247664" target="_blank">Testflight app</a> and then <a target="_blank" href="https://testflight.apple.com/join/nAJqOH0v">joining our Beta testing group</a>.
            </p>
            <h4>Android</h4>
            <p>
              If you are an Android user and would like to start using ChordClub, let us know through our <a target="_blank" href="https://groups.google.com/forum/#!topic/chordclub-support/l4czcmUDd0A">Google Group</a>.
            </p>
            <h3>Need support? Have feedback or feature request?</h3>
            <p>Get a hold of us through our <a href="https://groups.google.com/forum/#!forum/chordclub-support" target="_blank">Google group</a> or submit your request through the form at the bottom of this page.</p>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default Home;
