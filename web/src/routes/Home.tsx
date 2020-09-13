import * as React from 'react';
import Card from 'react-bootstrap/Card';
import {VideoContainer} from './VideoContainer';

const TUTORIAL_LINK = 'https://www.youtube.com/embed/NIGonOKmSNo';

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
              <li>Upload a photo of sheet music with the recording.</li>
              <li>Tag your recordings so you can review groups of relevant recordings at once.</li>
              <li>Share your recordings by tag with friends through the app.</li>
            </ul>
            <p>Two important notes about current limitations:</p>
            <ul>
              <li>You cannot create sheet music directly within the app.</li>
              <li>This is not meant for recording production quality audio.</li>
            </ul>
            <h3>Try it out!</h3>
            <div
              style={{
                display: 'flex', flexDirection: 'row',
                flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'
              }}
            >
              <div className="download-app">
                <a
                  href="http://itunes.com/apps/chordclub"
                >
                  <span style={{ padding: '15px' }} className="download-app-img-container">
                    <img
                      src="/assets/Download_on_the_App_Store.svg"
                      alt="Download on the appstore"
                    />
                  </span>
                </a>
              </div>
              <div className="download-app">
                <a
                  href={'https://play.google.com/store/apps/details?id=app.chordclub&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'}
                >
                  <span className="download-app-img-container">
                    <img
                      alt={'Get it on Google Play'}
                      src={'/assets/google-play-badge.png'}
                    />
                  </span>
                </a>
              </div>
            </div>
            <h3>Need support? Have feedback or feature request?</h3>
            <p>Get a hold of us through our <a href="https://groups.google.com/forum/#!forum/chordclub-support" target="_blank">Google group</a> or submit your request through the form at the bottom of this page.</p>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default Home;
