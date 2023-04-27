#include "lru.h"
#include <stdio.h>
#include <stdlib.h>
#include "cache.h"

void lru_init_queue(Set *set) {
  LRUNode *s = NULL;
  LRUNode **pp = &s;  // place to chain in the next node
  for (int i = 0; i < set->line_count; i++) {
    Line *line = &set->lines[i];
    LRUNode *node = (LRUNode *)(malloc(sizeof(LRUNode)));
    node->line = line;
    node->next = NULL;
    (*pp) = node;
    pp = &((*pp)->next);
  }
  set->lru_queue = s;
}

void lru_init(Cache *cache) {
  Set *sets = cache->sets;
  for (int i = 0; i < cache->set_count; i++) {
    lru_init_queue(&sets[i]);
  }
}

void lru_destroy(Cache *cache) {
  Set *sets = cache->sets;
  for (int i = 0; i < cache->set_count; i++) {
    LRUNode *p = sets[i].lru_queue;
    LRUNode *n = p;
    while (p != NULL) {
      p = p->next;
      free(n);
      n = p;
    }
    sets[i].lru_queue = NULL;
  }
}

void lru_fetch(Set *set, unsigned int tag, LRUResult *result) {
  LRUNode* node = set->lru_queue;
  LRUNode* previous = set->lru_queue;
  //case for only one node in queue needed

  //Edge case for list length = 1
  if(set->lru_queue->next == NULL){ //only one node
    // NODE IS HIT
    if(node->line->valid && node->line->tag == tag){
      result->access = HIT;
      result->line = node->line;
      return;
    } else if(!(node->line->valid)){
    // NODE IS COLD MISS (OVERWRITE INVALID)
      result->access = COLD_MISS;
      node->line->valid = '1';
      node->line->tag = tag;
      result->line = node->line;
      return;
    } else {
    // NODE IS CONFLICT MISS (OVERWRITE LEAST USED VALID)
      result->access = CONFLICT_MISS;
      node->line->tag = tag;
      node->line->valid = '1';
      result->line = node->line;
      return;
    }
  }

  //LIST LENGTH > 1

  // CHECK IF VALID && TAG = HIT
  int first_node = 1;
  while(node != NULL) {

    if(node->line->valid && node->line->tag == tag) {
      //found it
      result->access = HIT;
      if(!first_node){ //if it were first node no reordering would be necessary

        previous->next = node->next; //previous skips it
        node->next = set->lru_queue; //points to the old most recent
        set->lru_queue = node; //queue points at it as first
      }
      result->line = node->line;
      return;
    }
    previous = node; //stores previous node  
    node = (node->next == NULL ? NULL : node->next);
    first_node = 0;
  }

// LOOK FOR A NODE WITH INVALID BIT TO REPLACE
  node = set->lru_queue; //reset to starting nodes
  previous = set->lru_queue;
  first_node = 1;
  while(node != NULL) {
    if(!(node->line->valid)){
      //overwrite this node
      node->line->tag = tag;
      node->line->valid = '1';
      result->access = COLD_MISS;
      if(!first_node){
        previous->next = node->next; //previous skips it
        node->next = set->lru_queue; //points to the old most recent
        set->lru_queue = node; //queue points at it as first
      }
      result->line = node->line;
      return;
    }
    previous = node; //stores previous node
    node = (node->next == NULL ? NULL : node->next);
    first_node = 0;
  }
  //REPLACE FINAL (LEAST USED) NODE 
  previous = set->lru_queue; //reset nodes
  node = set->lru_queue;
  while(node->next != NULL) {
    previous = node;
    node = node->next;
  }
  // node is now last node, previous is second to last
  node->line->tag = tag;
  node->line->valid = '1';
  result->access = CONFLICT_MISS;

  previous->next = NULL;
  node->next = set->lru_queue;
  set->lru_queue = node;
  result->line = node->line;
  return;
}
