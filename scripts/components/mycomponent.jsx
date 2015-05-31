import React from 'react';
import packageJSON from '../../package.json';

let Mycomponent = React.createClass({
  render: function() {
    let version = packageJSON.version,
        deps, devDeps;
  deps = Object.keys(packageJSON.dependencies).map((dep, i) => <li key={i}>{dep}</li>);
    devDeps = Object.keys(packageJSON.devDependencies).map((dep, i) => <li key={i + 10}>{dep}</li>);

    return (
      <div>
        <h1 className="Mycomponent">Welcome to i h x &#9883; React Starterify</h1>
        <span>version {version}</span>
        <p>Powered by:</p>
        <ul>
          {deps.concat(devDeps)}
        </ul>
      </div>
    );
  }
});

export default Mycomponent;
