import React, {Component} from 'react';

export class VKAPILogin extends Component {
  componentWillMount() {
    //const script = document.createElement("script");
    //
    //script.src = "//vk.com/js/api/openapi.js?136";
    //
    //document.body.appendChild(script);
    //
    //console.log('hey componentWillMount 3');
    //console.log(window.VK);
    //
    //// VK.init({apiId: process.env.VK_API_SECRET});
  }

  componentDidUpdate() {

    //console.log('hey componentDidUpdate 4');
    //console.log(window.VK);
    //// VK.Widgets.Auth("VKAPIAuth", {
    //   width: "200px", onAuth: function (data) {
    //     alert('user ' + data['uid'] + ' authorized');
    //     console.log(VK);
    //   }
    // });
  }

  render() {
    return <div id="VKAPIAuth"></div>;
  }
}