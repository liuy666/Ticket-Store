/* jshint -W097 */
/* jshint -W117 */

'use strict';
import axios from 'axios';
import Qs from 'qs';
import Cookie from 'js-cookie';
import iView from 'iview';
import router from '@/router/index.js';
import home from '../store/modules/home.js';

let setTime = function(home){
    setTimeout(function(){
        home.state.isLoading = false;
    },500);
};

let loading = function(){
    setTime(home);
};


/**
 * Axios请求拦截器
 */
// axios.interceptors.request.use(config => {
//     // const token = JSON.parse(sessionStorage.getItem('token'));
//     const token = Cookies.get('token');
//     if (token) {
//         config.headers.Authorization = token;
//     }
//     return config;
// },error => {
//     return Promise.reject(error);
// });


/**
 * Axios返回请求拦截器
 */
// axios.interceptors.response.use(res => {
// 	return res;
// },err => {
// 	console.log(err.response.status);
// 	if(err.response.status === 401) {
// 		iView.Modal.error({
//             title: '温馨提示',
//             width: 500,
//             content: '您的登录状态已过期，请刷新重新登录',
//             onOk: () => {
//                 setTimeout(() => {
//                 	sessionStorage.removeItem('token');
// 					sessionStorage.clear();
// 					sessionStorage.clear();
// 					router.push('/login');
//                 }, 500);
//             }
//         });


// 	} else {
// 		iView.Modal.error({
//             title: '温馨提示',
//             content: '当前服务不可用，请手动刷新后重试'
//         });
// 		return Promise.reject(err);
// 	}
// });

/**
 * 单一请求--检查http状态码
 * @param {object} response -- 异步请求返回的数据对象
 * @return {object}  请求正常则返回数据对象data，否则返回自定义错误提示信息对象
 */
function checkStatus(response) {
    // console.log(response);

    // console.log('**** 检查HTTP状态码 ****');

    // 如果http状态码正常，则直接返回数据 暂时不考虑304 400的情况
    if(response.status === 200) {
        // 这里不需要除了data之外的数据，所以直接 return response.data
        // console.log(response.status);
        return {
            status: 200,
            data: response.data
        };
    }
    // console.log(response.status);
    return {
        status: -400,
        msg: '请确认您的网络连接正常，然后点击刷新重试'
    };
}

/**
 * 单一请求--检查异步请求的后端返回信息码code
 * @param {object} res -- 异步请求返回的数据主体对象
 * @return {object}  code正常则返回数据对象数据主体对象，否则弹出对话框显示msg信息
 */
function checkCode(res) {

    // console.log(res);

    // console.log('**** 检查CODE ****');

    if(res.status === -400) {
        iView.Modal.error({
            title: '温馨提示',
            width: 500,
            content: res.msg
        });
        return false;
    }
    // 如果code异常，可以弹出一个错误提示，告诉用户
    if(res.data.code === 200) {
        // console.log('**** 这里是数据 ****');
        return res.data;
    } else {
        iView.Modal.error({
            title: '温馨提示',
            width: 500,
            content: res.data.msg

        });
        // console.log('错误信息:\ncode:' + res.data.code + '\nmsg:' + res.data.msg);
        return Promise.reject(res.data.msg);
    }
}

/**
 * 并发请求--检查http状态码
 * @param {array} resList
 * @return {object}
 */
function checkAllStatus(resList) {
    // console.log('**** 检查并发HTTP状态码 ****');
    let isSuccess = resList.every(item => {
        return item.status === 200;
    });
    if(isSuccess) {
        let dataList = resList.map(item => {
            return item.data;
        });
        return {
            status: 200,
            data: dataList
        };
    } else {
        return {
            status: -400,
            msg: '请确认您的网络连接正常，然后点击刷新重试'
        };
    }
}

/**
 * 并发请求--检查异步请求的后端返回信息码code
 * @param {object} resObj
 * @return {object/array}
 */
function checkAllCode(resObj) {
    // console.log('**** 检查并发CODE ****');
    if(resObj.status === -400) {
        iView.Modal.error({
            title: '温馨提示',
            content: resObj.msg
        });
        return false;
    }
    let isSuccess = resObj.data.every(item => {
        return item.code === 200;
    });
    if(isSuccess) {
        let dataList = resObj.data.map(item => {
            return item.data;
        });
        // console.log('**** 这里是数据 ****');
        return dataList;
    } else {
        iView.Modal.error({
            title: '温馨提示',
            content: '当前服务不可用，请手动刷新后重试'
        });
        // console.log(resObj);
        return false;
    }
}


/*
 * Axios封装-get/post/put/delete/all
 */
export default {
    get(url,params) {
        params = Object.assign({},params,{
            'access_token': sessionStorage.getItem('name')
        });
        return axios({
            method: 'get',
            url,
            params
        })
            .then(checkStatus)
            .then(checkCode)
            .finally(loading);
    },
    get2(url,params) {
        return axios({
            method: 'get',
            url,
            params
        })
            .then(checkStatus)
            .then(checkCode)
            .finally(loading);
    },
    post(url,urlParams,bodyParams) {
        // console.log(urlParams);
        urlParams = Object.assign({},urlParams,{
            access_token: sessionStorage.getItem('name')
        });
        // console.log(urlParams);
        if(urlParams){
            url += '?' + Qs.stringify(urlParams);
            // console.log(url);
        }
        return axios({
            method: 'post',
            url,
            data: JSON.stringify(bodyParams),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(checkStatus)
            .then(checkCode)
            .finally(loading);
    },
    post2(url,urlParams,bodyParams) {
        // console.log(urlParams);
        // urlParams = Object.assign({},urlParams,{
        //     access_token: sessionStorage.getItem('name')
        // });
        // console.log(urlParams);
        if(urlParams){
            url += '?' + Qs.stringify(urlParams);
            // console.log(url);
        }
        return axios({
            method: 'post',
            url,
            data: JSON.stringify(bodyParams),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(checkStatus)
            .then(checkCode)
            .finally(loading);
    },
    put(url,urlParams,bodyParams) {
        urlParams = Object.assign({},urlParams,{
            'access_token': sessionStorage.getItem('name')
        });
        url += '?' + Qs.stringify(urlParams);
        return axios({
            method: 'put',
            url,
            data: JSON.stringify(bodyParams),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(checkStatus)
            .then(checkCode);
    },
    put2(url,urlParams,bodyParams) {
        url += '?' + Qs.stringify(urlParams);
        return axios({
            method: 'put',
            url,
            data: JSON.stringify(bodyParams),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(checkStatus)
            .then(checkCode);
    },
    delete(url,urlParams,bodyParams) {
        urlParams = Object.assign({},urlParams,{
            'access_token': sessionStorage.getItem('name')
        });
        url += '?' + Qs.stringify(urlParams);
        return axios({
            method: 'delete',
            url,
            data: JSON.stringify(bodyParams),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(checkStatus)
            .then(checkCode);
    },
    all(requestList) {
        requestList = requestList.map(item => {
            let queryParams = null;
            let urlParams = null;

            // 设置get请求的token
            if(item.queryParams) {
                queryParams = Object.assign({},{
                    'access_token': sessionStorage.getItem('name')
                },item.queryParams);
            } else {
                queryParams = {
                    'access_token': sessionStorage.getItem('name')
                };
            }

            // 设置post请求的token
            if(item.urlParams) {
                urlParams = Object.assign({},{
                    'access_token': sessionStorage.getItem('name')
                },item.urlParams);
            } else {
                urlParams = {
                    'access_token': sessionStorage.getItem('name')
                };
            }

            // 发出请求
            if(item.type === 'get') {
                item.url += '?' + Qs.stringify(queryParams);
                return axios.get(item.url);
            }
            if(item.type === 'post') {
                item.url += '?' + Qs.stringify(urlParams);
                return axios.post(item.url,item.bodyParams,{
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        });
        return axios.all(requestList)
            .then(axios.spread((...resList) => {
                return checkAllStatus(resList);
            }))
            .then(resObj => {
                return checkAllCode(resObj);
            });
    }
};
