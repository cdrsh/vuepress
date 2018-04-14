import * as consts from "./constants";
import Vue from "vue";
import * as conf from "../../../config";
export default {
    //Comments load success
    [consts.COMMENTS_LOAD_SUCCESS](state, obj) {
        state.comments = obj.comments;
        state.commentsPgNum = obj.pgNum;
        state.commentsAllItems = obj.itemsCount;
    },

    //Set load comments indicator
    [consts.COMMENTS_LOAD_INDICATOR](state, val) {
        state.commentsLoadIndicator = val;
    },

    //Answer comment indicator
    [consts.COMMENT_ANSWER_INDICATOR](state, val) {
        state.commentAnswerIndicator = val;
    },

    //Answer comment success
    [consts.COMMENT_ANSWER_SUCCESS](state, obj) {
        let lvl = -1;
        let posParent = 0;
        let insPos = 0;
        //Find tail of sublist
        for (let i = 0; i < state.comments.length; i++)
            //lvl from here
            if (state.comments[i].id == obj.pid) {
                posParent = i;
                break;
            }
        //Last element
        if (posParent == state.comments.length - 1) {
            insPos = state.comments.length;
        } else {
            //Element with children
            if (
                state.comments[posParent + 1].lvl >
                state.comments[posParent].lvl
            ) {
                insPos = posParent + 1;
                for (let i = posParent + 1; i < state.comments.length; i++)
                    if (state.comments[i].lvl > state.comments[posParent].lvl)
                        insPos = i;
                    else break;
                insPos++;
            } else {
                //Element without children
                insPos = posParent + 1;
            }
        }
        let len = state.comments.length;
        for (let j = len; j >= insPos; j--)
            Vue.set(state.comments, j, state.comments[j - 1]);
        Vue.set(state.comments, insPos, obj);
        state.commentsAllItems++;
    },

    //Add comment indicator
    [consts.COMMENT_ADD_INDICATOR](state, val) {
        state.commentAddIndicator = val;
    },

    //Add comment success
    [consts.COMMENT_ADD_SUCCESS](state, obj) {
        Vue.set(state.comments, state.comments.length, obj);
        state.commentsAllItems++;
    }
};
