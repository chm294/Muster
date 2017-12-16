import React from 'react';
import CollectionEntry from './CollectionEntry';
import firebase from 'firebase';
import { firebaseAuth, rootRef, collection, category, item, users} from '../../../config/firebaseCredentials';
import { BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom'

class CollectionList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categoryName:'',
      collections: [],
    }
    this.getCollectionData = this.getCollectionData.bind(this)
  }

  componentDidMount() {
    this.getCollectionData()
  }

  getCollectionData() {
    let categoryId = this.props.match.params.categoryId.slice(1);
    new Promise((resolve, reject) => {
      category.child(categoryId).on('value', (snap) => {
        this.setState({categoryName: categoryId})
        return resolve(snap.val())
      })
    })
    .then((categoryObj) => {
      return Object.keys(categoryObj.collectionId)
    })
    .then((collectionIdArr) => {
      var arr = [];
      collectionIdArr.forEach(id => {
        var tempPromise = new Promise((resolve, reject) => {
          collection.child(id).on('value', function(snap) {
            resolve([id, snap.val()])
          })
        })
        arr.push(tempPromise);
      })
      return Promise.all(arr);
    })
    .then((collectionArr) => {
      var resultArr = [];
      collectionArr.forEach((arr) => {
        var tempPromise = new Promise((resolve, reject) => {
          let userId = arr[1]['uid']
          users.child(userId[0]).on('value', (snap) => {
            arr = arr.concat(snap.val())
            resolve(arr)
          })
        })
        resultArr.push(tempPromise)
      })
      return Promise.all(resultArr)
    })
    .then(data => {
      if (data[0] !== null && data[1] !== null) {
        this.setState({collections: data})
      }
    })
  }
  

  render() {
    return(
      this.state.collections.length > 0
       ? <div>
          <h2>{this.state.categoryName}</h2>
          {this.state.collections.map((colArr) => {
            return <div>
                    <Link to={`/items/:${colArr[0]}`} key={colArr[0]}>
                      <CollectionEntry collection={colArr[1]} />
                    </Link>
                    <p>{colArr[2]['profileInfo']['username']}</p>
                  </div>
            })
          }
        </div>
      : 'loading'
    )
  }
}

export default CollectionList;