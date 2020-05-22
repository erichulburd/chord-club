import * as React from 'react';
import Card from 'react-bootstrap/Card';

class Home extends React.Component {

  public render() {
    return (
      <div id="home">
        <Card>
          <Card.Body>
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
            <h2>Need support?</h2>
            <p>Get a hold of us through our <a href="https://groups.google.com/forum/#!forum/chordclub-support" target="_blank">Google group</a>.</p>
          </Card.Body>
        </Card>

      </div>
    );
  }
}

export default Home;
