import React, {useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
interface FriendsSectionItemProps {
    name: string;
    profilePic: string;
}
const testImage = "https://www.rollingstone.com/wp-content/uploads/2018/06/bladerunner-2-trailer-watch-8bd914b0-744f-43fe-9904-2564e9d7e15c.jpg"
function FriendsSectionItem({name, profilePic} : FriendsSectionItemProps) {
    return (
        <div className='friendsSectionItem'>
            <img src={profilePic} alt='Uh Oh'/>
            <div className='friendsSectionItemName'>{name}</div>
        </div>
    )
}
function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login();
    }
    const login = () => {
        console.log(`${process.env.REACT_APP_API_URL}/api/login`)
        axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
            email: email,
            password: password
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
          setErrorMessage("Your Email or Password is incorrect")
        });
    }
    return  (
    <div className='homeScaffold'>
      <div className='friendsSection'>
        <div style={{textAlign : 'center'}}>Chats</div>
        <FriendsSectionItem name='Literally Him' profilePic={testImage}/>
      </div>
      <div className='chatSection'>
        <div className='chatHeader'>
          <img src={testImage}/>
          <div>Literally Him</div>
        </div>
        <div className='chatContent'></div>
        <div className='MessageInputComponent'><input type='text' placeholder={'Literally him'}/></div>
      </div>
    </div>
    );
}


export default Home;